<div align="center">
<h1>Flask ML Adapter</h1>
<a href="https://github.com/jonathanlo411/flask-ml-adapter/releases"><img src="https://img.shields.io/github/v/release/jonathanlo411/flask-ml-adapter?color=f56827"></a><a href="https://github.com/jonathanlo411/flask-ml-adapter/blob/main/LICENSE"><img src="https://img.shields.io/github/license/jonathanlo411/flask-ml-adapter"></a>
<br><img src="https://img.shields.io/github/pipenv/locked/dependency-version/jonathanlo411/flask-ml-adapter/flask"><img src="https://img.shields.io/github/pipenv/locked/dependency-version/jonathanlo411/flask-ml-adapter/scikit-learn"><img src="https://img.shields.io/github/pipenv/locked/dependency-version/jonathanlo411/flask-ml-adapter/keras"><br>
<a href="https://mybinder.org/v2/gh/jonathanlo411/flask-ml-adapter/main?labpath=model-dev%2Fmodel-dev.ipynb"><img src="https://mybinder.org/badge_logo.svg"></a>
<p style="text-align: center;">An adapter example to receive ML model responses over HTTPS.</p>
</div>

## Table of Contents
- [Details](#details)
- [Models](#models)
- [Using](#using)
- [Running Locally](#running-locally)

## Details
This application demonstrates how python models can be called from a different codebase and context using HTTPS. Usually this would be done utilizing a system call via protobuf  with  [gRPC](https://grpc.io/) but this process can be used if one does not want to go into microservices.

## Models
| Model | Est. Full Classify Time| Link |
|--|--|--|
|AdaBoostClassifier.pkl  |13 seconds| [<image src="https://cdn.discordapp.com/attachments/942218891952783421/1141451574565154987/scikit-learn-logo-small.png">](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.AdaBoostClassifier.html) |
|GaussianNaiveBayes.pkl| 4 seconds|[<image src="https://cdn.discordapp.com/attachments/942218891952783421/1141451574565154987/scikit-learn-logo-small.png">](https://scikit-learn.org/stable/modules/generated/sklearn.naive_bayes.GaussianNB.html)|
|GradientBoostClassifier.pkl|6 seconds|[<image src="https://cdn.discordapp.com/attachments/942218891952783421/1141451574565154987/scikit-learn-logo-small.png">](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.GradientBoostingClassifier.html)|
|KerasFNN.pkl|1 minute 35 seconds |[<image src="https://cdn.discordapp.com/attachments/942218891952783421/1141453498957967521/keras_1.png">](https://keras.io/api/)
|RandomForestClassifier.pkl|20 seconds|[<image src="https://cdn.discordapp.com/attachments/942218891952783421/1141451574565154987/scikit-learn-logo-small.png">](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html)|
|SupportVectorClassifier.pkl|5 seconds |[<image src="https://cdn.discordapp.com/attachments/942218891952783421/1141451574565154987/scikit-learn-logo-small.png">](https://scikit-learn.org/stable/modules/generated/sklearn.svm.SVC.html)|


## Using
1. Select a model from the drop down
2. Identify Point or Full Classify
	2.1. Select a point from the table and hit "Submit Classifier Request"
	2.2 (OR) Hit "Classify All Points"
4. Await results. Sample requests and response will be shown.
![screenshot of application](https://cdn.discordapp.com/attachments/942218891952783421/1141467865229299843/127.0.0.1_5000_.png)

## Running Locally
### Using Setup Scripts
1. Clone the repository
2. `cd` into the repo and use `setup.sh`
```bash
./scripts/setup.sh
```
3. After setup, use the start script
```bash
./scripts/start.sh
```

### Manually
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
# navigate to http://127.0.0.1:5000
```
