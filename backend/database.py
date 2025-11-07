from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

MYSQL_URL = (
    "mysql+mysqlconnector://avnadmin:AVNS_MHbvjkqsU7rk8B_PWMG"
    "@cupcake-diguroos-1a48.e.aivencloud.com:15718/defaultdb?ssl-mode=REQUIRED"
)

engine = create_engine(MYSQL_URL, connect_args={"ssl_disabled": True})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
