from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend import models, schemas, utils
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not utils.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")

    return {
        "message": "Login bem-sucedido",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "is_admin": db_user.is_admin
        }
    }



@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # No Swagger, o campo se chama "username" — usamos ele como email
    db_user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not db_user or not utils.verify_password(form_data.password, db_user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")

    token = utils.create_access_token({"sub": db_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "is_admin": db_user.is_admin
        }
    }
