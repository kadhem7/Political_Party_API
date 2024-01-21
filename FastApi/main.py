from fastapi import FastAPI, HTTPException, Depends
from typing import Annotated, List
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import SessionLocal, engine
import models
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()  # initialize main app

# Handle Cross-Origin Resource Sharing
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

# Defining Models for Data in/out API
class PoliticalPartyBase(BaseModel):
    name: str
    ideology: str
    founded_year: int
    is_ruling: bool

class PoliticalPartyModel(PoliticalPartyBase):
    id: int

    class Config:
        orm_mode = True

# Database Connection Setup
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

models.Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "Hello. You might want to check SWAGGER. If so go to http://localhost:8000/docs"}

# Create Political Party
@app.post("/political_parties/", response_model=PoliticalPartyModel)
async def create_political_party(party: PoliticalPartyBase, db: db_dependency):
    db_party = models.PoliticalParty(**party.dict())
    db.add(db_party)
    db.commit()
    db.refresh(db_party)
    return db_party

# Show Political Parties
@app.get("/political_parties/", response_model=List[PoliticalPartyModel])
async def read_political_parties(db: db_dependency, skip: int = 0, limit: int = 100):
    parties = db.query(models.PoliticalParty).offset(skip).limit(limit).all()
    return parties

# Update Political Party
@app.put("/political_parties/{party_id}", response_model=PoliticalPartyModel)
async def update_political_party(
        party_id: int,
        party: PoliticalPartyBase,
        db: db_dependency
):
    db_party = db.query(models.PoliticalParty).filter(models.PoliticalParty.id == party_id).first()
    if db_party:
        for key, value in party.dict().items():
            setattr(db_party, key, value)
        db.commit()
        db.refresh(db_party)
        return db_party
    else:
        raise HTTPException(status_code=404, detail="Political Party not found")

# Delete Political Party
@app.delete("/political_parties/{party_id}", response_model=PoliticalPartyModel)
async def delete_political_party(party_id: int, db: db_dependency):
    db_party = db.query(models.PoliticalParty).filter(models.PoliticalParty.id == party_id).first()
    if db_party:
        db.delete(db_party)
        db.commit()
        return db_party
    else:
        raise HTTPException(status_code=404, detail="Political Party not found")
