from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Contest, Problem
from django.utils import timezone
from datetime import timedelta
import uuid

class PublicApiTests(APITestCase):
    def setUp(self):
        # Create Dummy Data
        # virtual_id defaults to uuid4, which is fine.
        start_time = timezone.now() - timedelta(minutes=10)
        end_time = timezone.now() + timedelta(hours=2)
        self.contest = Contest.objects.create(
            id=1001,
            name='Public Contest',
            start_time=start_time,
            end_time=end_time
        )
        # We need to refresh to get the generated virtual_id ? 
        # No, create returns the object with defaults if they are set?
        # Default is callable. create() populates it? Yes.
        # But to be safe, refresh or just rely on object. 
        # But wait, create() DOES assign defaults. 
        # Note: we used default=uuid.uuid4 in model.
        
        self.problem = Problem.objects.create(
            contest=self.contest,
            index='A',
            rating=1000,
            points=500,
            url='http://example.com/problem/A',
            description_kr='Korean Description'
        )

        # Future contest (Not started)
        start_future = timezone.now() + timedelta(days=1)
        end_future = timezone.now() + timedelta(days=1, hours=2)
        self.future_contest = Contest.objects.create(
            id=1002,
            name='Future Contest',
            start_time=start_future,
            end_time=end_future
        )
        self.future_problem = Problem.objects.create(
            contest=self.future_contest,
            index='B',
            rating=1200,
            points=500,
             url='http://example.com/problem/B',
            description_kr='Future Description'
        )


        # URLs - Use virtual_id
        # Note: paths must match urls.py definitions
        self.contest_list_url = '/api/contests/contests/'
        self.contest_detail_url = f'/api/contests/contests/{self.contest.virtual_id}/'
        self.problem_list_url = '/api/contests/problems/'
        self.problem_list_by_contest_url = f'/api/contests/problems/{self.contest.virtual_id}/'
        self.problem_detail_url = f'/api/contests/problems/{self.contest.virtual_id}/{self.problem.id}/'
        
        self.future_contest_detail_url = f'/api/contests/contests/{self.future_contest.virtual_id}/'
        self.future_problem_list_by_contest_url = f'/api/contests/problems/{self.future_contest.virtual_id}/'
        self.future_problem_detail_url = f'/api/contests/problems/{self.future_contest.virtual_id}/{self.future_problem.id}/'

    def test_list_contests(self):
        """Public user can list contests."""
        response = self.client.get(self.contest_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify virtual_id is present
        results = response.data.get('results', response.data)
        self.assertTrue(len(results) >= 1)
        # Check that we have virtual_id in response
        self.assertIn('virtual_id', results[0])

    def test_retrieve_contest(self):
        """Public user can retrieve a specific contest by virtual_id."""
        response = self.client.get(self.contest_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Public Contest')
        # Since it started, ID should be visible
        self.assertIn('id', response.data)
        self.assertEqual(response.data['id'], 1001)

    def test_retrieve_future_contest_security(self):
        """Pre-contest security: Real ID should be hidden."""
        response = self.client.get(self.future_contest_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # virtual_id used to retrieve, so it succeeds.
        # But 'id' field should be hidden.
        self.assertNotIn('id', response.data)
        self.assertEqual(response.data['name'], 'Future Contest')

    def test_list_problems_by_contest(self):
        """Public user can list problems by virtual_id (Started contest)."""
        response = self.client.get(self.problem_list_by_contest_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that we got results
        # If response is paginated (not likely for this action unless configured), it might be dict or list.
        # list_by_contest returns serializer.data, which is a list.
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['index'], 'A')

    def test_list_problems_future_security(self):
        """Pre-contest security: Problems should be inaccessible."""
        response = self.client.get(self.future_problem_list_by_contest_url)
        # Views.py checks start time -> 403
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_retrieve_problem_future_security(self):
         """Pre-contest security: Specific problem should be inaccessible."""
         response = self.client.get(self.future_problem_detail_url)
         self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
