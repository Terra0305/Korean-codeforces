from django.test import TestCase
from django.utils import timezone
from datetime import datetime, timezone as dt_timezone
from .utils import calculate_participant_stats
from .models import Problem, Contest
from unittest.mock import MagicMock

class UtilsTestCase(TestCase):
    def test_calculate_participant_stats_penalty(self):
        # Setup mock contest start time
        # 2026-02-03 12:00:00 UTC
        start_time = datetime(2026, 2, 3, 12, 0, 0, tzinfo=dt_timezone.utc)
        
        # Setup mock problems
        p1 = MagicMock()
        p1.index = "A"
        p1.points = 500
        
        p2 = MagicMock()
        p2.index = "B"
        p2.points = 1000
        
        problems = [p1, p2]
        
        # Scenario:
        # User solved Problem A at 12:10:00 (10 mins in) -> Penalty: 10
        # User solved Problem B at 12:30:00 (30 mins in), but after 1 fail -> Penalty: 30 + 20 = 50
        
        submissions = [
            {
                "creationTimeSeconds": start_time.timestamp() + 600, # 10 mins
                "problem": {"index": "A"},
                "verdict": "OK",
            },
            {
                "creationTimeSeconds": start_time.timestamp() + 1800, # 30 mins
                "problem": {"index": "B"},
                "verdict": "OK",
            },
            {
                "creationTimeSeconds": start_time.timestamp() + 1200, # 20 mins (Fail)
                "problem": {"index": "B"},
                "verdict": "WRONG_ANSWER",
            }
        ]
        
        result = calculate_participant_stats(submissions, problems, start_time)
        
        # Total Score: 500 + 1000 = 1500
        self.assertEqual(result['total_score'], 1500)
        
        # Total Penalty: 10 (A) + 50 (B) = 60
        self.assertEqual(result['penalty'], 60)
        
        # Status String: "+:+1" (assuming simple concatenation order A then B)
        # Note: implementation detail of dict order, list order matters
        # calculate_participant_stats iterates over `problems` list
        self.assertIn("+", result['problem_status'])
        self.assertIn("+1", result['problem_status'])

    def test_calculate_participant_stats_early_submission(self):
        # Scenario: Submission happens BEFORE start time (should be 0 penalty time, but logically valid if allowed)
        # Usually shouldn't happen during contest, but ensures robustness (no negative penalty)
        
        start_time = datetime(2026, 2, 3, 12, 0, 0, tzinfo=dt_timezone.utc)
        p1 = MagicMock()
        p1.index = "A"
        p1.points = 500
        problems = [p1]
        
        submissions = [
            {
                "creationTimeSeconds": start_time.timestamp() - 60, # 1 min before
                "problem": {"index": "A"},
                "verdict": "OK",
            }
        ]
        
        result = calculate_participant_stats(submissions, problems, start_time)
        
        # Should solve, penalty time 0 (max(0, ...))
        self.assertEqual(result['total_score'], 500)
        self.assertEqual(result['penalty'], 0)
