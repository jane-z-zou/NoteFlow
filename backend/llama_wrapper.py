# llama_wrapper.py

from llama_cpp import Llama

# Load the model (adjust path to your file)
llm = Llama(model_path="/Users/lianzou/Canva-AI-agent-2/models/tinyllama-1.1b-chat-v1.0.Q5_K_M.gguf.download/tinyllama-1.1b-chat-v1.0.Q5_K_M.gguf", n_ctx=2048, verbose=False)

def generate_local_llm_response(prompt, max_tokens=256):
    response = llm(prompt, max_tokens=max_tokens, stop=["</s>"])
    return response["choices"][0]["text"].strip()
