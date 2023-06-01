FROM python:3.9-slim

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUn pip install --upgrade pip
RUN pip install -r requirements.txt

COPY ./app /app/app

CMD ["python", "-m", "app"]