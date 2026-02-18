"""
Web Scraper Service - Extracts content from business websites
Modular service for scraping contact/about pages
"""

import requests
from typing import Optional, Dict, List
import logging
import urllib3

logger = logging.getLogger(__name__)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class WebScraperService:
    """Service for scraping business websites to find contacts"""
    
    def __init__(self):
        self.timeout = 10
        # Use a session for connection reuse and simple retry strategies
        self.session = requests.Session()

        # Default header (will rotate User-Agent on retries)
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        }

        # A few common User-Agent strings to rotate if a site blocks a request
        self._user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        ]
        # Common paths for contact pages
        self.contact_paths = [
            '/contact',
            '/contact-us',
            '/about',
            '/team',
            '/about-us',
            '/our-team',
            '/staff',
            '/people'
        ]
    
    def scrape_website(self, url: str) -> Optional[str]:
        """
        Scrape a website and return cleaned HTML content
        
        Args:
            url: Website URL to scrape
            
        Returns:
            Cleaned text content from the website or None if failed
        """
        if not url:
            return None
        
        try:
            # Ensure URL has protocol
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
            
            # Try a small number of attempts rotating headers and toggling scheme on 403
            response = None
            last_exc = None
            for attempt in range(3):
                # rotate user agent
                ua = self._user_agents[attempt % len(self._user_agents)]
                headers = {**self.headers, 'User-Agent': ua, 'Referer': url}
                try:
                    response = self.session.get(
                        url,
                        headers=headers,
                        timeout=self.timeout,
                        allow_redirects=True,
                    )
                    # If not a 403, break and parse
                    if response.status_code == 403:
                        logger.debug(f"Attempt {attempt+1}: 403 for {url} with UA={ua}")
                        # try switching scheme (https <-> http) once
                        if url.startswith('https://'):
                            alt = 'http://' + url[len('https://'):]
                        elif url.startswith('http://'):
                            alt = 'https://' + url[len('http://'):]
                        else:
                            alt = None

                        if alt:
                            logger.debug(f"Trying alternate scheme: {alt}")
                            try:
                                response = self.session.get(alt, headers=headers, timeout=self.timeout, allow_redirects=True)
                                if response.status_code != 403:
                                    url = alt
                                    break
                            except Exception as exc:
                                last_exc = exc
                        # otherwise continue loop and try another UA
                        last_exc = Exception(f"403 Forbidden for {url}")
                        continue

                    response.raise_for_status()
                    break
                except requests.exceptions.SSLError as exc:
                    last_exc = exc
                    logger.debug(f"Attempt {attempt+1} SSL verification failed for {url}: {exc}")

                    # Fallback for websites with incomplete certificate chains:
                    # retry same request without certificate verification.
                    try:
                        response = self.session.get(
                            url,
                            headers=headers,
                            timeout=self.timeout,
                            allow_redirects=True,
                            verify=False,
                        )
                        response.raise_for_status()
                        logger.warning(f"SSL verify disabled for {url} due to certificate validation failure")
                        break
                    except requests.exceptions.RequestException as insecure_exc:
                        last_exc = insecure_exc
                        logger.debug(f"Attempt {attempt+1} insecure retry failed for {url}: {insecure_exc}")
                        continue
                except requests.exceptions.RequestException as exc:
                    last_exc = exc
                    logger.debug(f"Attempt {attempt+1} request failed for {url}: {exc}")
                    continue

            if response is None:
                if last_exc:
                    raise last_exc
                return None
            
            # Parse and clean HTML (import BeautifulSoup lazily so missing
            # optional dependency doesn't break app startup)
            try:
                from bs4 import BeautifulSoup
            except ImportError:
                logger.error("bs4 (beautifulsoup4) is not installed; cannot parse HTML")
                return None

            soup = BeautifulSoup(response.content, 'lxml')
            
            # Remove script and style elements
            for script in soup(['script', 'style']):
                script.decompose()
            
            # Get text
            text = soup.get_text()
            
            # Clean up whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = '\n'.join(chunk for chunk in chunks if chunk)
            
            return text[:5000]  # Limit to first 5000 chars for LLM efficiency
            
        except requests.exceptions.Timeout:
            logger.warning(f"Timeout scraping {url}")
            return None
        except requests.exceptions.ConnectionError:
            logger.warning(f"Connection error scraping {url}")
            return None
        except Exception as e:
            logger.warning(f"Error scraping {url}: {str(e)}")
            return None
    
    def scrape_contact_pages(self, website_url: str) -> Optional[str]:
        """
        Try to find and scrape contact/about pages
        
        Args:
            website_url: Base website URL
            
        Returns:
            Content from contact page or main website
        """
        if not website_url:
            return None
        
        # Try main website first
        main_content = self.scrape_website(website_url)
        if main_content and len(main_content) > 500:
            return main_content
        
        # Try common contact page paths
        for path in self.contact_paths:
            contact_url = website_url.rstrip('/') + path
            content = self.scrape_website(contact_url)
            if content and len(content) > 300:
                return content

        
        # Return main content if nothing better found
        return main_content
    
    def extract_text_section(self, html_text: str, keywords: List[str]) -> Optional[str]:
        """
        Extract text sections containing specific keywords
        
        Args:
            html_text: Text content from scraped page
            keywords: List of keywords to search for
            
        Returns:
            Relevant text section or None
        """
        if not html_text:
            return None
        
        lines = html_text.split('\n')
        relevant_lines = []
        
        # Find lines containing keywords
        for line in lines:
            lower_line = line.lower()
            if any(keyword.lower() in lower_line for keyword in keywords):
                # Collect context around keyword lines
                start = max(0, lines.index(line) - 2)
                end = min(len(lines), lines.index(line) + 3)
                relevant_lines.extend(lines[start:end])
        
        if relevant_lines:
            return '\n'.join(relevant_lines)
        
        # If no keywords found, return first 1000 chars
        return html_text[:1000]
