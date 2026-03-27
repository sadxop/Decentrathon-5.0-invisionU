from pydantic import BaseModel
from typing import Literal


class DecisionPayload(BaseModel):
    decision: Literal["Approved", "Rejected"]
    admin_note: str

