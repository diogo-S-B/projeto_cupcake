from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from .. import models, schemas, utils
from ..database import get_db

router = APIRouter(prefix="/products", tags=["Products"])


# Todos os usuários (autenticados ou não) podem visualizar produtos
@router.get("/", response_model=list[schemas.ProductResponse])
def listar_produtos(
    id: Optional[int] = Query(None, description="Filtra pelo ID do produto (opcional)"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Product).filter(models.Product.active == True)

    if id is not None:
        produto = query.filter(models.Product.id == id).first()
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        return [produto]

    return query.all()


# Somente administradores podem criar produtos
@router.post("/", response_model=schemas.ProductResponse)
def criar_produto(
    produto: schemas.ProductBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem criar produtos"
        )

    novo = models.Product(**produto.dict())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


# Somente administradores podem atualizar produtos
@router.put("/{id}", response_model=schemas.ProductResponse)
def atualizar_produto(
    id: int,
    produto: schemas.ProductBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem atualizar produtos"
        )

    db_produto = db.query(models.Product).filter(models.Product.id == id).first()
    if not db_produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    for key, value in produto.dict().items():
        setattr(db_produto, key, value)

    db.commit()
    db.refresh(db_produto)
    return db_produto


# Somente administradores podem deletar produtos
@router.delete("/{id}")
def deletar_produto(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem excluir produtos"
        )

    produto = db.query(models.Product).filter(models.Product.id == id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    db.delete(produto)
    db.commit()
    return {"message": "Produto removido com sucesso"}
