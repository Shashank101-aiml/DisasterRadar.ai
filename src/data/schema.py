"""
Hydrological & Meteorological Data Validation Schema
Using Pandera for data quality, type checking, and range assertions.
"""

import pandera as pa
from pandera import Column, Check, DataFrameSchema

HydrologicalSchema = DataFrameSchema(
    columns={
        "timestamp": Column(pa.DateTime, nullable=False),
        "latitude": Column(pa.Float, Check.in_range(-90.0, 90.0), nullable=False),
        "longitude": Column(pa.Float, Check.in_range(-180.0, 180.0), nullable=False),
        
        # Rainfall Accumulation Windows (mm)
        "rainfall_1h": Column(pa.Float, Check.ge(0.0), nullable=False),
        "rainfall_3h": Column(pa.Float, Check.ge(0.0), nullable=False),
        "rainfall_6h": Column(pa.Float, Check.ge(0.0), nullable=False),
        "rainfall_24h": Column(pa.Float, Check.ge(0.0), nullable=False),
        "rainfall_3day": Column(pa.Float, Check.ge(0.0), nullable=False),
        
        # Hydrological Variables
        "river_discharge": Column(pa.Float, Check.ge(0.0), nullable=False), # m^3/s
        "discharge_change": Column(pa.Float, nullable=False),               # Rate of rise / fall
        "runoff": Column(pa.Float, Check.ge(0.0), nullable=False),          # mm
        "soil_wetness": Column(pa.Float, Check.in_range(0.0, 1.0), nullable=False), # 0.0 - 1.0 fraction
        
        # Geospatial Variables
        "elevation": Column(pa.Float, Check.ge(-50.0), nullable=False),     # meters
        "slope": Column(pa.Float, Check.ge(0.0), nullable=False),           # degrees
        "distance_to_river": Column(pa.Float, Check.ge(0.0), nullable=False), # meters
        
        # Binary Ground Truth
        "flood": Column(pa.Int, Check.isin([0, 1]), nullable=False)
    },
    coerce=True,
    strict=False
)

def validate_hydrological_data(df):
    """Validates dataframe against the HydrologicalSchema."""
    return HydrologicalSchema.validate(df)
