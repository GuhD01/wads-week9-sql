from pydantic import BaseModel

class TodoBase(BaseModel):
    text: str

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    text: str
    completed: bool

class TodoDisplay(BaseModel):
    id: int
    text: str
    completed: bool

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    pass

class UserDisplay(BaseModel):
    id: int
    username: str
    todos: list[TodoDisplay] = []

    class Config:
        orm_mode = True
        
class TodoStatusUpdate(BaseModel):
    completed: bool