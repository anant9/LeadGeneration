"""Tests for Services"""
import pytest
from app.utils.helpers import calculate_distance


def test_calculate_distance():
    """Test distance calculation"""
    # New York to Los Angeles (approximately 3944 km)
    ny_lat, ny_lon = 40.7128, -74.0060
    la_lat, la_lon = 34.0522, -118.2437
    
    distance = calculate_distance(ny_lat, ny_lon, la_lat, la_lon)
    
    # Check if distance is approximately correct (within 50 km)
    assert 3900 < distance < 4000, f"Expected distance ~3944 km, got {distance} km"
