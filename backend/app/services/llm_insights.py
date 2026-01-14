import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv
load_dotenv()
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

class AIInsight(BaseModel):
    executive_summary: str = Field(description="A 2-3 sentence overview of data quality.")
    critical_issues: list = Field(description="List of critical issues found.")
    recommendations: list = Field(description="List of actionable recommendations.")
    dbt_tests: list = Field(description="Suggested dbt tests.")

class LLMService:
    def __init__(self):
        self.default_model = "claude-3-5-haiku-latest"

    def get_model(self, model_name: str):
        if "claude" in model_name.lower():
            return ChatAnthropic(model=model_name, anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"))
        elif "gemini" in model_name.lower():
            return ChatGoogleGenerativeAI(model=model_name, google_api_key=os.getenv("GOOGLE_API_KEY"))
        else:
            # Fallback or default
            return ChatAnthropic(model=self.default_model, anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"))

    async def generate_insights(self, profiling_results: Dict[str, Any], model_name: str = "claude-3-haiku-20240307") -> Dict[str, Any]:
        llm = self.get_model(model_name)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert data quality analyst. Analyze the data profiling results and respond with ONLY valid JSON (no markdown, no code blocks).

The JSON must have this exact structure with string values only:
{{
  "executive_summary": "A 2-3 sentence overview of the data quality.",
  "critical_issues": ["Issue 1 description", "Issue 2 description"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "dbt_tests": ["unique: column_name", "not_null: column_name"]
}}

IMPORTANT: All array items must be simple strings, not objects. For dbt_tests, use simple test notation like "unique: id" or "not_null: email"."""),
            ("user", "PROFILING RESULTS:\n{results}\n\nRespond with valid JSON only.")
        ])
        
        chain = prompt | llm | JsonOutputParser()
        
        try:
            response = await chain.ainvoke({"results": profiling_results})
            return response
        except Exception as e:
            print(f"Error generating AI insights: {e}")
            return {
                "executive_summary": "Error generating AI insights. Please check your API keys and connection.",
                "critical_issues": [],
                "recommendations": [],
                "dbt_tests": []
            }

# Singleton instance
llm_service = LLMService()
