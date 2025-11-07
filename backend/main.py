from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import auth, products, orders, admin
from . import models, utils
from .database import SessionLocal

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cupcake App API 🍰")

origins = [
    "http://localhost:8080",   
    "https://projeto-cupcake-six.vercel.app",
    "https://projeto-cupcake-six.vercel.app/login.html"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(admin.router)
@app.get("/")
def home():
    return {"message": "Bem-vindo ao Cupcake App API!"}

def create_default_admin():
    db = SessionLocal()
    admin = db.query(models.User).filter(models.User.email == "admin@admin.com").first()
    if not admin:
        admin = models.User(
            name="Admin",
            email="admin@admin.com",
            password=utils.hash_password("1234"),
            is_admin=True
        )
        db.add(admin)
        db.commit()
    db.close()

create_default_admin()
