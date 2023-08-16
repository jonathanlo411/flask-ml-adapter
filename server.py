# Imports
import os
from flask import Flask, request, render_template
import csv

from pandas import DataFrame
from joblib import load
from util import *

# Setup
app = Flask(__name__)

# Page Render
@app.route('/', methods=['GET'])
def page():
    models = os.listdir("models")   
    context = {
        "models": models
    }
    return render_template('index.html', context=context)


# --- APIs ---

@app.route('/api/data', methods=['GET'])
def data():
    with open("model-dev/titanic.csv", "r", newline='') as fh:
        csv_reader = csv.reader(fh, delimiter=',')
        titanic_data = list(csv_reader)
    return titanic_data

@app.route('/api/model', methods=['GET', 'POST'])
def model():
    if request.method == 'GET':
        return os.listdir("models") 
    else:
        args = request.args
        if ('model' not in args) or (args.get('model') not in os.listdir('models')):
            return {
                "success": 0,
                "message": "Invalid Model"
            }, 400
        model = args.get('model')
        submitData = request.get_json()
        if isinstance(submitData, list):
            return handle_batch_request(model, submitData)
        elif isinstance(submitData, dict):
            return call_model(model, submitData)
        else:
            return {
                "success": 0,
                "message": "Invalid Model"
            }, 400



# --- Helpers ---

def call_model(model_name, point, batch=False):
    try:
        if model_name == 'KerasFNN.pkl':
            # Load point
            if batch:
                point_df = point
            else:
                point_df = DataFrame(point, index=['0'])
            column_data_types = {
                "PassengerId": int,
                "Pclass": int,
                "Name": str,
                "Sex": str,
                "Age": float,
                "SibSp": int,
                "Parch": int,
                "Ticket": str,
                "Fare": float,
                "Cabin": str,
                "Embarked": str
            }
            for column, data_type in column_data_types.items():
                point_df[column] = point_df[column].astype(data_type)
            cleaned = preproccess_nn(point_df)

            # Load model and make preds
            model = load(f'./models/{model_name}')
            y_pred_prob = model.predict(cleaned)
            y_pred = (y_pred_prob > 0.5).astype(int)
            return {
                "success": 1,
                "message": f"Model prediction for model: {model_name}",
                "prediction": int(y_pred)
            }, 200

        else:
            # Load point
            if batch:
                point_df = point
            else:
                point_df = DataFrame(point, index=['0'])
            point_df = point_df.drop(['PassengerId', 'Name', 'Ticket', 'Cabin'], axis=1)
            if 'Survived' in point_df:
                point_df = point_df.drop(['Survived'], axis=1)

            # Load model and make preds
            model = load(f'./models/{model_name}')
            predictions = model.predict(point_df)
            return {
                "success": 1,
                "message": f"Model prediction for model: {model_name}",
                "prediction": int(predictions)
            }, 200
    except Exception as e:
        print(e, flush=True)
        return {
            "success": 0,
            "message": "Internal Server Error"
        }, 500

def handle_batch_request(model, submitData):
    submitDataHeaders = submitData.pop(0)
    errors = []
    predResponses = {}
    
    # Attempt to handle a mass submit otherwise iterate one by one
    try:
        submitDataDF = DataFrame(submitData, columns=submitDataHeaders)
        pred_result = call_model(model, submitDataDF, batch=True)
        if 'success' in pred_result[0] and pred_result[0]['success'] == 0:
            raise ValueError()
        return {
            "success": 1,
            "message": f"Model prediction for model: {model}",
            "prediction": pred_result
        }, 200
    except Exception as e:
        for dataRow in submitData:
            try:
                point = dict(zip(submitDataHeaders, dataRow))
                pred_result = call_model(model, point)
                if 'success' in pred_result[0] and pred_result[0]['success'] == 0:
                    raise ValueError()
                predResponses[point['PassengerId']] = pred_result[0]['prediction']
            except Exception as e:
                errors.append(point['PassengerId'])

    dataReturn = ({
        "success": 1,
        "message": f"Model prediction for model: {model}",
        "prediction": predResponses,
        "errors": errors
    }, 200) if len(errors) < len(submitData) else ({
        "success": 0,
        "message": "Internal Server Error"
    }, 500)
    return dataReturn
