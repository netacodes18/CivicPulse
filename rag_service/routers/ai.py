from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import logging
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from config import config

logger = logging.getLogger(__name__)

router = APIRouter()

def _get_llm():
    return ChatGoogleGenerativeAI(
        model=config.LLM_MODEL,
        api_key=config.GOOGLE_API_KEY,
        temperature=0.2, # Lower temperature for summarization/translation
        max_output_tokens=config.LLM_MAX_TOKENS,
    )

class SummaryRequest(BaseModel):
    reports: list[dict] = Field(..., description="List of report dictionaries to summarize")
    state: str = Field(default="Unknown", description="State or jurisdiction name")

class SummaryResponse(BaseModel):
    summary: str

class TranslateRequest(BaseModel):
    text: str = Field(..., description="The text to translate")
    target_language: str = Field(..., description="The language to translate to (e.g., 'English', 'Hindi')")

class TranslateResponse(BaseModel):
    translated_text: str

@router.post("/summarize", response_model=SummaryResponse)
async def generate_summary(request: SummaryRequest):
    """Generates an executive summary of recent municipal reports."""
    if not request.reports:
        return SummaryResponse(summary="No reports provided to summarize.")
    
    try:
        llm = _get_llm()
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert municipal analyst. Your job is to read a list of recent civic issue reports and provide a concise, professional executive summary for the municipal authority. Do NOT hallucinate. Group the issues logically by category (e.g., Water, Roads, Sanitation). Highlight the most urgent or frequent issues. Keep it concise. Format the response in Markdown."),
            ("human", "Here are the recent reports for {state}:\n{reports}")
        ])
        
        chain = prompt | llm | StrOutputParser()
        
        # Serialize reports to a concise JSON string
        reports_json = json.dumps(request.reports, default=str)
        
        summary = await chain.ainvoke({
            "state": request.state,
            "reports": reports_json
        })
        
        return SummaryResponse(summary=summary)
    except Exception as e:
        logger.error(f"Error generating summary: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/translate", response_model=TranslateResponse)
async def translate_text(request: TranslateRequest):
    """Translates text to the target language."""
    if not request.text.strip():
        return TranslateResponse(translated_text="")
        
    try:
        llm = _get_llm()
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a professional translator specializing in civic and municipal terminology. Translate the following text into {target_language}. Preserve the original tone and context. Do not add any extra conversational text. Return ONLY the translated text."),
            ("human", "{text}")
        ])
        
        chain = prompt | llm | StrOutputParser()
        
        translated = await chain.ainvoke({
            "target_language": request.target_language,
            "text": request.text
        })
        
        return TranslateResponse(translated_text=translated.strip())
    except Exception as e:
        logger.error(f"Error translating text: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
