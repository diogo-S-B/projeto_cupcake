from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from .. import models, schemas, utils
from ..database import get_db

router = APIRouter(prefix="/orders", tags=["Orders"])


# Qualquer usuário logado pode criar pedido
@router.post("/create", response_model=schemas.OrderResponse)
def criar_pedido(
    pedido: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    # Garante que o usuário autenticado é o dono do pedido
    if pedido.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Você só pode criar pedidos para sua própria conta.")

    # Cria o pedido
    new_order = models.Order(
        user_id=pedido.user_id,
        total=pedido.total,
        status="Pendente"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Processa cada item do pedido
    for item in pedido.items:
        product = db.query(models.Product).filter(models.Product.id == item.id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Produto ID {item.id} não encontrado")

        # Verifica estoque
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Estoque insuficiente para {product.name}")

        # Diminui o estoque
        product.stock -= item.quantity

        # Adiciona o item ao pedido
        order_item = models.OrderItem(
            order_id=new_order.id,
            product_id=item.id,
            quantity=item.quantity
        )
        db.add(order_item)

    db.commit()
    db.refresh(new_order)
    return new_order


# Somente administradores podem atualizar status
@router.put("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem atualizar o status de pedidos"
        )

    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    if status not in ["Aguardando Pagamento", "Pago", "Cancelado"]:
        raise HTTPException(status_code=400, detail="Status inválido")

    order.status = status
    db.commit()
    db.refresh(order)
    return order


# Usuário autenticado só pode ver seus próprios pedidos
@router.get("/user/{user_id}", response_model=list[schemas.OrderResponse])
def listar_pedidos_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    
):

    orders = (
        db.query(models.Order)
        .filter(models.Order.user_id == user_id)
        .options(
            joinedload(models.Order.items).joinedload(models.OrderItem.product)
        )
        .all()
    )
    return orders
