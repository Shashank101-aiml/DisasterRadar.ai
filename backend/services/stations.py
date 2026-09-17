from typing import List
from models.schemas import StationData

REGIONAL_STATIONS: List[StationData] = [
    StationData(name='Bengaluru', lat=12.9716, lng=77.5946, risk='severe', level='Severe Risk', prob=78.4, r24=85.0, r72=190.0, elev=900.0, temp=25.0, hum=82.0),
    StationData(name='Nelamangala', lat=13.0970, lng=77.3912, risk='moderate', level='Moderate', prob=42.0, r24=45.0, r72=95.0, elev=882.0, temp=26.0, hum=68.0),
    StationData(name='Yelahanka', lat=13.1007, lng=77.5963, risk='high', level='High Risk', prob=64.5, r24=68.0, r72=140.0, elev=915.0, temp=25.0, hum=76.0),
    StationData(name='Hoskote', lat=13.0700, lng=77.7981, risk='high', level='High Risk', prob=68.2, r24=72.0, r72=155.0, elev=875.0, temp=24.0, hum=78.0),
    StationData(name='Kolar', lat=13.1367, lng=78.1291, risk='low', level='Low Risk', prob=18.5, r24=15.0, r72=30.0, elev=822.0, temp=28.0, hum=55.0),
    StationData(name='Hosur', lat=12.7409, lng=77.8253, risk='severe', level='Severe Risk', prob=82.1, r24=92.0, r72=205.0, elev=879.0, temp=24.0, hum=85.0),
    StationData(name='Anekal', lat=12.7107, lng=77.6974, risk='high', level='High Risk', prob=65.0, r24=66.0, r72=145.0, elev=915.0, temp=25.0, hum=74.0),
    StationData(name='Kanakapura', lat=12.5461, lng=77.4190, risk='moderate', level='Moderate', prob=48.3, r24=48.0, r72=110.0, elev=638.0, temp=27.0, hum=65.0),
    StationData(name='Ramanagara', lat=12.7209, lng=77.2799, risk='moderate', level='Moderate', prob=44.7, r24=42.0, r72=105.0, elev=747.0, temp=27.0, hum=67.0),
    StationData(name='Magadi', lat=12.9562, lng=77.2289, risk='low', level='Low Risk', prob=24.1, r24=20.0, r72=45.0, elev=925.0, temp=26.0, hum=60.0)
]

def get_all_stations() -> List[StationData]:
    return REGIONAL_STATIONS
