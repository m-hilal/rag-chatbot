# RAG Chatbot with PDF Support

A sophisticated Retrieval-Augmented Generation (RAG) chatbot application that enables users to upload PDF documents and ask questions about their content. The chatbot uses advanced NLP models from IBM Watson to understand documents and provide accurate answers.

## Features

- **PDF Upload**: Easy drag-and-drop interface to upload PDF documents
- **Intelligent Q&A**: Ask questions about the uploaded document and get contextual answers
- **Vector Database**: Uses Chroma vector store for efficient document retrieval
- **Advanced Embeddings**: IBM Slate embeddings for high-quality semantic search
- **Large Language Model**: Powered by Mistral AI for natural language understanding
- **Web Interface**: User-friendly Gradio interface for seamless interaction
- **Fast Processing**: Optimized text chunking and retrieval for quick responses

## Installation

### Prerequisites
- Python 3.8 or higher
- IBM Watson AI credentials and project ID

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/m-hilal/rag-chatbot.git
   cd rag-chatbot
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure IBM Watson credentials**
   - Set up your IBM Cloud account and create a Watson AI project
   - Update the `project_id` in `qabot.py` with your project ID
   - Set your authentication credentials (handled automatically or via environment variables)

## Usage

### Running the Application

```bash
python qabot.py
```

The application will launch at `http://0.0.0.0:7860` and be accessible via the shared URL.

### How to Use

1. Open the web interface in your browser
2. Click on "Upload PDF File" and select a PDF document
3. Type your question in the "Input Query" field
4. Click "Submit" to get an answer based on the document content
5. The chatbot will return relevant answers extracted from the PDF

## Architecture

```
PDF Upload
    ↓
Document Loader (PyPDFLoader)
    ↓
Text Splitter (RecursiveCharacterTextSplitter)
    ↓
Vector Embeddings (IBM Slate)
    ↓
Vector Database (Chroma)
    ↓
Retriever + LLM (Mistral AI)
    ↓
Response
```

## Component Details

### Document Processing Pipeline

1. **Document Loader**: Uses PyPDFLoader to extract text from PDF files
2. **Text Splitter**: Splits documents into manageable chunks (1000 tokens with 50-token overlap)
3. **Embeddings**: Converts text chunks into vector representations using IBM Slate embeddings
4. **Vector Store**: Stores embeddings in Chroma for efficient similarity search

### LLM Configuration

- **Model**: `mistralai/mistral-medium-2505`
- **Max Tokens**: 256
- **Temperature**: 0.5 (balanced between deterministic and creative responses)
- **URL**: IBM Watson endpoint (`https://us-south.ml.cloud.ibm.com`)

### Embedding Model

- **Model**: `ibm/slate-125m-english-rtrvr-v2`
- **Truncate Input Tokens**: 3
- **Return Options**: Includes input text in response

## Configuration

You can customize the following parameters in `qabot.py`:

```python
# Text Splitter Settings
chunk_size = 1000          # Size of text chunks
chunk_overlap = 50         # Overlap between chunks

# LLM Settings
MAX_NEW_TOKENS = 256       # Maximum response length
TEMPERATURE = 0.5          # Response creativity level (0-1)

# Server Settings
server_name = "0.0.0.0"    # Server address
server_port = 7860         # Server port
```

## Requirements

See `requirements.txt` for all dependencies. Key packages include:

- `ibm-watsonx-ai`: IBM Watson AI API integration
- `langchain`: Framework for LLM applications
- `langchain-community`: Community integrations
- `langchain-ibm`: IBM-specific LangChain components
- `gradio`: Web interface framework
- `chromadb`: Vector database

## Deployment

### Local Development
```bash
python qabot.py
```
Access at: `http://localhost:7860`

### Remote Deployment
The application is configured to run on `0.0.0.0:7860` with share mode enabled, making it accessible from anywhere.

### Docker Deployment (Optional)
Consider containerizing the application for production use:

```dockerfile
FROM python:3.10
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "qabot.py"]
```

## Troubleshooting

### Common Issues

**Issue**: Authentication errors when connecting to IBM Watson
- **Solution**: Verify your IBM Cloud credentials and project ID are correct

**Issue**: Slow response times
- **Solution**: Reduce `chunk_size` or increase `chunk_overlap` for faster processing

**Issue**: Inaccurate answers
- **Solution**: Check the PDF quality and adjust temperature parameter in LLM configuration

**Issue**: PDF loading errors
- **Solution**: Ensure the PDF is not corrupted and is in standard PDF format

## Security Considerations

- Store your IBM Watson credentials securely using environment variables
- Do not commit credentials to version control
- Use authentication tokens with appropriate expiration times
- Consider implementing rate limiting for production deployments
- Validate and sanitize user inputs

## Technologies Used

- **Python 3.8+**: Core programming language
- **IBM Watson AI**: LLM and embeddings
- **LangChain**: RAG framework
- **Gradio**: Web interface
- **Chroma**: Vector database
- **PyPDF**: PDF processing

## Support

For issues, questions, or suggestions, please contact:
- **Email**: mhilal.official@gmail.com

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

**Last Updated**: 2026-05-20
**Version**: 1.0.0