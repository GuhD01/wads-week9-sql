from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from . import crud, models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/users/", response_model=schemas.UserDisplay)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)

@app.get("/users/{user_id}", response_model=schemas.UserDisplay)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.post("/users/{user_id}/todos", response_model=schemas.TodoDisplay)
def create_todo_for_user(user_id: int, todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    return crud.create_todo(db=db, todo=todo, user_id=user_id)

@app.get("/users/{user_id}/todos", response_model=list[schemas.TodoDisplay])
def read_todos_for_user(user_id: int, db: Session = Depends(get_db)):
    return crud.get_todos_by_user(db, user_id)

@app.put("/users/{user_id}/todos/{todo_id}", response_model=schemas.TodoDisplay)
def update_todo_for_user(todo_id: int, todo: schemas.TodoUpdate, db: Session = Depends(get_db)):
    updated_todo = crud.update_todo(db, todo_id, todo)
    if updated_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return updated_todo

@app.delete("/users/{user_id}/todos/{todo_id}")
def delete_todo_for_user(todo_id: int, db: Session = Depends(get_db)):
    if not crud.delete_todo(db, todo_id):
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"ok": True}

@app.put("/users/{user_id}/todos/{todo_id}/status", response_model=schemas.TodoDisplay)
def update_todo_status_for_user(todo_id: int, status: schemas.TodoStatusUpdate, db: Session = Depends(get_db)):
    updated_todo = crud.update_todo_status(db, todo_id, status.completed)
    if updated_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return updated_todo

@app.get("/users/{user_id}/todos/status")
def read_todos_by_status(user_id: int, completed: bool = Query(None), db: Session = Depends(get_db)):
    todos = db.query(models.TodoItem).filter(models.TodoItem.user_id == user_id)
    if completed is not None:
        todos = todos.filter(models.TodoItem.completed == completed)
    return todos.all()

@app.get("/todos/{todo_id}", response_model=schemas.TodoDisplay)
def read_todo_by_id(todo_id: int, db: Session = Depends(get_db)):
    todo = crud.get_todo_by_id(db, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@app.get("/users/{user_id}/todos/search")
def read_todos_by_name(user_id: int, name: str = Query(None), db: Session = Depends(get_db)):
    if name is None:
        raise HTTPException(status_code=400, detail="Name query parameter is required")
    todos = crud.get_todos_by_name(db, user_id, name)
    return todos