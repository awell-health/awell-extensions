# Awell Extensions

You can find all the documentation [here](https://developers.awellhealth.com/awell-extensions/docs/getting-started/what-are-awell-extensions).


## Running this locally
If you want to test webhooks locally, because the extensions server isn't exposed in the local k8s setup, you'll need to do a little trickery:
1. run `kubectl apply -f ./local-extensions-service.yaml`, which opens a node port on the k8s side
2. in a terminal window, run `kubectl port-forward service/extensions-nodeport 30080:80`, which forwards any requests sent to 30080 to the local extensions service
3. Put ngrok to work and forward it to 30080 (`ngrok http 30080`)

Now, you can hit the extensions server by hitting `http://localhost:30080`, and you can also test the webhooks as you see fit!