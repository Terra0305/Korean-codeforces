from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Contest, Problem
from django.utils import timezone
from datetime import timedelta

class PublicApiTests(APITestCase):
    def setUp(self):
        # Create Dummy Data
        self.contest = Contest.objects.create(
            id=1001,
            name='Public Contest',
            start_time=timezone.now(),
            end_time=timezone.now() + timedelta(hours=2)
        )
        self.problem = Problem.objects.create(
            contest=self.contest,
            index='A',
            rating=1000,
            points=500,
            url='http://example.com/problem/A',
            description_kr='Korean Description'
        )

        # URLs - manually constructing to match what user reported
        # We can also use reverse if we knew the names, but manual string is better for regression testing 404s
        self.contest_list_url = '/api/contests/contests/'
        self.contest_detail_url = f'/api/contests/contests/{self.contest.id}/'
        self.problem_list_url = '/api/contests/problems/'
        self.problem_list_by_contest_url = f'/api/contests/problems/{self.contest.id}/'
        self.problem_detail_url = f'/api/contests/problems/{self.contest.id}/{self.problem.id}/'

    def test_list_contests(self):
        """Public user can list contests."""
        response = self.client.get(self.contest_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Public Contest')

    def test_retrieve_contest(self):
        """Public user can retrieve a specific contest."""
        response = self.client.get(self.contest_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Public Contest')

    def test_list_problems(self):
        """Public user can list all problems."""
        response = self.client.get(self.problem_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['index'], 'A')

    def test_list_problems_by_contest(self):
        """Public user can list problems by contest ID."""
        response = self.client.get(self.problem_list_by_contest_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['index'], 'A')

    def test_retrieve_problem(self):
        """Public user can retrieve a specific problem."""
        response = self.client.get(self.problem_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['index'], 'A')

    def test_trailing_slash_handling(self):
        """Ensure paths with trailing slashes work (regression test for 404)."""
        # Already covered by above tests using trailing slashes, but explicit check:
        response = self.client.get('/api/contests/contests/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
