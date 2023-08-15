# Flask ML Adapter
An adapter example to receive model responses over HTTPS.

## Details
This application demonstrates how python models can be called from a different codebase and context using HTTPS. Usually this would be done utilizing a system call via protobuf  with  [gRPC](https://grpc.io/) but the simplistic process of HTTPS can be used if one does not want to go into microservice hell. The current application supports 3 models: [AdaBoostClassifier](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.AdaBoostClassifier.html) (SKL), [RandomForrestClassifier](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html) (SKL), and [Feedforward Neural Network](https://keras.io/) (Keras).  Models are currently trained only on the [Kaggle Titanic Dataset](https://www.kaggle.com/competitions/titanic). 

## Using
1. Select a model
2. Select a point from the table
3. Hit "Submit Classifier Request"
4. View Results and Code Generation below

## Setup
1. Clone the repository.
2. Create your virtual environment and install the requirements.
```bash
python3 -m venv flask-env
. flask-env/Scripts/activate  #or . flask-env/bin/activate
pip install -r requirements.txt
```
3. Launch Flask
```bash
flask --app server run
```
4. Follow steps for [using](#using).
Flask ML Adapter
An adapter example to receive model responses over HTTPS.

Details
This application demonstrates how python models can be called from a different codebase and context using HTTPS. Usually this would be done utilizing a system call via protobuf with gRPC but the simplistic process of HTTPS can be used if one does not want to go into microservice hell. The current application supports 3 models: AdaBoostClassifier (SKL), RandomForrestClassifier (SKL), and Feedforward Neural Network (Keras). Models are currently trained only on the Kaggle Titanic Dataset.

Using
Select a model
Select a point from the table
Hit “Submit Classifier Request”
View Results and Code Generation below
Setup
Clone the repository.
Create your virtual environment and install the requirements.
python3 -m venv flask-env
. flask-env/Scripts/activate  //or . flask-env/bin/activate
pip install -r requirements.txt
Launch Flask
flask --app server run
Follow steps for using.
Markdown 1320 bytes 158 words 25 lines Ln 25, Col 36HTML 821 characters 142 words 18 paragraphs
