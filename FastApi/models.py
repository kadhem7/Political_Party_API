from database import Base
from sqlalchemy import Column, Integer, String, Boolean

class PoliticalParty(Base):
    __tablename__ = 'political_parties'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    ideology = Column(String)
    founded_year = Column(Integer)
    is_ruling = Column(Boolean)
