from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from .. import models, schemas, utils
from ..database import get_db
from passlib.context import CryptContext

router = APIRouter(prefix="/admin", tags=["Admin"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# LOGIN DE ADMINISTRADOR
@router.post("/login")
def admin_login(email: str, password: str, db: Session = Depends(get_db)):
    admin = db.query(models.User).filter(models.User.email == email).first()

    if not admin or not admin.is_admin:
        raise HTTPException(status_code=403, detail="Acesso negado: usuário não é administrador")

    if not utils.verify_password(password, admin.password):
        raise HTTPException(status_code=401, detail="Senha incorreta")

    access_token = utils.create_access_token({"sub": admin.email})
    return {"access_token": access_token, "token_type": "bearer"}


# LISTAR TODOS OS PEDIDOS (somente admin)
@router.get("/orders", response_model=list[schemas.OrderResponse])
def listar_todos_pedidos(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem listar pedidos")

    pedidos = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.product))
        .all()
    )
    return pedidos


# ATUALIZAR STATUS DE PEDIDO (somente admin)
@router.put("/orders/{id}")
def atualizar_status_pedido(
    id: int,
    status: str = Query(..., description="Novo status do pedido"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem atualizar pedidos")

    pedido = db.query(models.Order).filter(models.Order.id == id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    if status not in ["Pendente", "Aguardando Pagamento", "Pago", "Cancelado"]:
        raise HTTPException(status_code=400, detail="Status inválido")

    pedido.status = status
    db.commit()
    db.refresh(pedido)
    return {"message": f"Status do pedido {id} atualizado para '{status}'"}
