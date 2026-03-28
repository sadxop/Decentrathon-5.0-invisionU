from fastapi import APIRouter

from .v1 import (
    analyze,
    analyze_batch,
    list_candidates,
    get_candidate,
    set_decision,
    patch_status,
    delete_candidate,
    shortlist,
    metrics,
)


router = APIRouter(tags=["legacy"])

# Backward-compatible routes for existing frontend.
router.add_api_route("/analyze", analyze, methods=["POST"])
router.add_api_route("/analyze/batch", analyze_batch, methods=["POST"])
router.add_api_route("/candidates", list_candidates, methods=["GET"])
router.add_api_route("/candidates/{candidate_id}", get_candidate, methods=["GET"])
router.add_api_route("/candidates/{candidate_id}/decision", set_decision, methods=["POST"])
router.add_api_route("/candidates/{candidate_id}/status", patch_status, methods=["PATCH"])
router.add_api_route("/candidates/{candidate_id}", delete_candidate, methods=["DELETE"])
router.add_api_route("/shortlist", shortlist, methods=["GET"])
router.add_api_route("/metrics", metrics, methods=["GET"])

