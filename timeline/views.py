from django.shortcuts import render
import json


def main(request):
    context = {}
    with open("data/myself.json") as fp:
        context["context"] = json.load(fp)

    return render(request, "main.html", context)
