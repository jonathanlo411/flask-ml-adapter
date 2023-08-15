
def preproccess_nn(titanic_data):
    titanic_data = titanic_data.drop(["PassengerId", "Name", "Ticket", "Cabin", "Embarked"], axis=1)
    titanic_data["Age"].fillna(titanic_data["Age"].median(), inplace=True)
    titanic_data["Fare"].fillna(titanic_data["Fare"].median(), inplace=True)
    titanic_data["Sex"] = titanic_data["Sex"].map({"male": 0, "female": 1})
    return titanic_data