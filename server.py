# Imports
import os
from flask import Flask, request, render_template
import csv

from pandas import DataFrame
from joblib import load

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
            }, 403
        model = args.get('model')
        point = request.get_json()
        return call_model(model, point)


# --- Helpers ---

def call_model(model_name, point):
    # try:
        # Load point
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
    # except Exception as e:
    #     return {
    #         "success": 0,
    #         "message": "Internal Server Error"
    #     }, 500

