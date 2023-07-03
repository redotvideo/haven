FROM nvcr.io/nvidia/pytorch:21.07-py3

RUN apt update

RUN pip uninstall -y torch && pip uninstall -y apex

RUN git clone https://github.com/vllm-project/vllm.git; \
    cd ./vllm; \
    sed -i '52s/compute_capabilities = {70, 75, 80, 86, 90}/compute_capabilities = {70, 75, 80}/' setup.py; \
    pip install -e .

ENV PYTHONPATH "/vllm:${PYTHONPATH}"

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUn pip install --upgrade pip

RUN apt-get update && apt-get install -y build-essential

RUN pip install -r requirements.txt && pip uninstall -y protobuf && pip install protobuf==3.20.2 && pip -y uninstall pydantic

COPY ./app /app/app

CMD ["python", "-m", "app"]