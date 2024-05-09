from sqlalchemy.orm import Session
from .models import User, TodoItem
from .schemas import TodoCreate, TodoUpdate, UserCreate

def create_user(db: Session, user: UserCreate):
    db_user = User(username=user.username)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def create_todo(db: Session, todo: TodoCreate, user_id: int):
    db_todo = TodoItem(**todo.dict(), user_id=user_id)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

def get_todos_by_user(db: Session, user_id: int):
    return db.query(TodoItem).filter(TodoItem.user_id == user_id).all()

def update_todo(db: Session, todo_id: int, todo: TodoUpdate):
    db_todo = db.query(TodoItem).filter(TodoItem.id == todo_id).first()
    if db_todo:
        db_todo.text = todo.text
        db_todo.completed = todo.completed
        db.commit()
        return db_todo
    return None

def delete_todo(db: Session, todo_id: int):
    db_todo = db.query(TodoItem).filter(TodoItem.id == todo_id).first()
    if db_todo:
        db.delete(db_todo)
        db.commit()
        return True
    return False

def get_todo_by_id(db: Session, todo_id: int):
    return db.query(TodoItem).filter(TodoItem.id == todo_id).first()

def get_todos_by_name(db: Session, user_id: int, name: str):
    return db.query(TodoItem).filter(TodoItem.user_id == user_id, TodoItem.text.contains(name)).all()
