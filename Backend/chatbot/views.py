from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
import os

from chatbot.models import ChatHistory, ChatSession
import openai
import requests
from django.test import RequestFactory
from django.contrib.auth.models import AnonymousUser
from django.urls import reverse
from django.http import JsonResponse


#openai_api_key = os.getenv(OP)
#openai.api_key = openai_api_key

def ask_openai(message, chat_history):
    system_content = "You are an AI assistant who knows everything. Try to keep your answer short and brief."

    # Build the messages list from the chat history
    messages = [{"role": "system", "content": system_content}]
    for entry in chat_history.get('data', {}).get('chat_history', []):
        messages.append({"role": "user", "content": entry['question']})
        messages.append({"role": "assistant", "content": entry['response']})

    # Append the current message
    messages.append({"role": "user", "content": message})

    try:
        client = openai.OpenAI(
            api_key=os.getenv('OPEN-AI-KEY'),
            base_url="https://api.aimlapi.com",
        )
        
        chat_completion = client.chat.completions.create(
            model="mistralai/Mistral-7B-Instruct-v0.2",
            messages=messages,
            temperature=0.5,
            max_tokens=128,
        )
        
        answer = chat_completion.choices[0].message.content
        return answer

    except Exception as e:
        # Handle any exception, including rate limit errors
        if "429" in str(e):
            return "Free limit exceeded"
        raise Http404(f"An unexpected error occurred: {str(e)}")

def make_external_request(auth_header,session_id):
     # Construct the URL for the manage-session view
    url = reverse('manage-session', kwargs={'session_id': session_id})
    # Construct the absolute URL
    absolute_url = f"http://localhost:8000{url}"  # Replace with your actual domain or use request.build_absolute_uri(url) if you have the request

    # Include the Authorization header in the new request
    headers = {
        'Authorization': auth_header,
    }
    print('ye to dekh ',headers," ",url)
    # Make the GET request with headers
    response = requests.get(absolute_url, headers=headers)
    print('yhaa to dekh ',response)

    # Handle the response
    if response.status_code == 200:
        return response.json()  # or handle the response as needed
    else:
        return {'error': 'Request failed', 'status_code': response.status_code}

def truncate_to_word_limit(text, word_limit):
    words = text.split()
    if len(words) > word_limit:
        return ' '.join(words[:word_limit]) + '...'
    else:
        return text
def count_words(sentence):
    # Split the sentence into words based on whitespace and return the count
    words = sentence.split()
    return len(words)


session_not_existing = "Session does not exist"


class CreateChatMessageView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request, *args, **kwargs):

        print("le pakad ",request.headers['Authorization'])
        # retrieve user
        user = self.request.user
        question = request.data.get('question')
       
        
        session_id = request.data.get('session_id')
        is_first_question = False

        session = None
        f_ans=None

        # check if session id exists
        if session_id is not None:
            try:
                ChatSession.objects.get(id=session_id)
            except ObjectDoesNotExist:
                resp_data = {'status': 'error', "response": session_not_existing}
                return Response(resp_data, status=400)
        else:
            # create session
            f_ans=ask_openai(question,{'data':{'chat_history':[]}})
            session = ChatSession.objects.create(user=user, name=question.lower())
            session_id = session.id
            is_first_question = True
        
        resp=None
        if f_ans is None:
            #testing
            auth=request.headers['Authorization']
            print('abhi tkk to thik h ',auth)
            resp=make_external_request(auth,session_id)
            # Now `response` contains the response from the view
            print('ye raha\n')
            print(resp)
            #testing
        ans=None
        if f_ans is not None:
            ans=f_ans
        else:
            ans=ask_openai(question,resp)
        #ans=question
        wl=int(0.73*count_words(ans))
        response = truncate_to_word_limit(ans, wl) if count_words(ans) > 73 else truncate_to_word_limit(ans, count_words(ans))

        # chat history information
        chat_history_info = {
            "session_id": session_id,
            "question": question,
            "response": response
        }
        

        # save chat history
        chat_history = ChatHistory.objects.create(**chat_history_info)
        
        if is_first_question:
            chat_history_info["session_name"] = question
            chat_history_info["session"] = {
                "id": session.id,
                "user_id": session.user.id,
                "name": session.name,
                "created_on": session.created_on,
                "updated_on": session.updated_on
            }

        chat_history_info["created_on"] = chat_history.created_on
        chat_history_info["id"] = chat_history.id
        chat_history_info["updated_on"] = chat_history.updated_on

        return JsonResponse({'status': 'success', "data": chat_history_info}, safe=False)


class GetChatSessionsView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request, *args, **kwargs):
        # retrieve user
        user = self.request.user

        # retrieve user chat sessions
        chat_sessions = list(ChatSession.objects.filter(user=user).values())

        return JsonResponse({'status': 'success', "data": chat_sessions}, safe=False)


class ManageChatSessionView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request, *args, **kwargs):
        # retrieve user
        user = self.request.user
        session_id = kwargs.get('session_id')
        print('yha tkk poncha h ',session_id)

        # retrieve user chat session
        try:
            chat_session = ChatSession.objects.get(id=session_id, user=user)
            chat_history = list(ChatHistory.objects.filter(session_id=chat_session.id).values())

            # construct response data
            resp_data = {
                "name": chat_session.name,
                "chat_history": chat_history
            }
            return JsonResponse({'status': 'success', "data": resp_data}, safe=False)
        except ObjectDoesNotExist:
            resp_data = {'status': 'error', "response": session_not_existing}
            return Response(resp_data, status=400)

    def delete(self, request, *args, **kwargs):
        # retrieve user
        user = self.request.user
        session_id = kwargs.get('session_id')

        # retrieve user chat session
        try:
            chat_session = ChatSession.objects.get(id=session_id, user=user)
            chat_session.delete()

            return JsonResponse({'status': 'success', "response": "Session deleted successfully"}, safe=False)
        except ObjectDoesNotExist:
            resp_data = {'status': 'error', "response": "Session does not exist"}
            return Response(resp_data, status=400)

    def put(self, request, *args, **kwargs):
        # retrieve user
        user = self.request.user
        session_id = kwargs.get('session_id')
        name = request.data.get('name')

        # retrieve user chat session
        try:
            chat_session = ChatSession.objects.get(id=session_id, user=user)
            chat_session.name = name
            chat_session.save()

            return JsonResponse({'status': 'success', "response": "Session updated successfully"}, safe=False)
        except ObjectDoesNotExist:
            resp_data = {'status': 'error', "response": session_not_existing}
            return Response(resp_data, status=400)