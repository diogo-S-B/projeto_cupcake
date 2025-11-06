from pydantic import BaseModel, constr
from typing import Optional, List
from datetime import datetime

# ---------- Usuário ----------
class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(BaseModel):
    name: str
    email: str
    password: constr(min_length=3) # type: ignore

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_admin: bool

    class Config:
        from_attributes = True

# ---------- Produto ----------
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    flavor: str
    stock: int
    active: bool = True
    image_url: str = ""

class ProductResponse(ProductBase):
    id: int
    class Config:
        from_attributes = True

# ---------- Pedido ----------
# ---------- Pedido ----------

class OrderBase(BaseModel):
    status: Optional[str] = "Pendente"


# Representa um produto dentro de um item de pedido
class ProductInItem(BaseModel):
    id: int
    name: str
    price: float

    class Config:
        from_attributes = True


# Representa o item do pedido com o produto incluso
class OrderItemResponse(BaseModel):
    id: int
    quantity: int
    product: ProductInItem   # ✅ inclui o produto completo (com nome e preço)

    class Config:
        from_attributes = True


# Pedido retornado
class OrderResponse(BaseModel):
    id: int
    user_id: int
    total: float
    status: str
    created_at: datetime
    items: List[OrderItemResponse] = []  # ✅ usa o schema novo com product

    class Config:
        from_attributes = True


# Pedido enviado ao criar
class OrderItemCreate(BaseModel):
    id: int  # id do produto
    quantity: int


class OrderCreate(BaseModel):
    user_id: int
    total: float
    items: List[OrderItemCreate]  # ✅ separa o modelo de criação do de resposta
    status: Optional[str] = "Pendente"
