import os
import redis
import smtplib
import datetime
import requests
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv

# Load the variables from .envrc
load_dotenv(dotenv_path=".envrc")

REDIS_URL = os.environ.get('REDIS_URL', None)
REDIS_KEY = os.environ.get('REDIS_KEY', None)
SOURCE_EMAIL = os.environ.get('SOURCE_EMAIL', None)
SOURCE_EMAIL_PASSWORD = os.environ.get('SOURCE_EMAIL_PASSWORD', None)

assert SOURCE_EMAIL_PASSWORD and SOURCE_EMAIL and REDIS_KEY and REDIS_URL, "Missing necessary environment variable"

# Connect to redis
redis_client = redis.Redis.from_url(REDIS_URL)

# replace 'REDIS_KEY' with your actual key
redis_result = redis_client.lrange(REDIS_KEY, 0, -1)

print(f"Found {len(redis_result)} books to send")

for item in redis_result:
    # Assuming url and email are comma separated in Redis
    url, email = item.decode().split(',')
    print(f"Sending {url} to {email}")

    if not email or not url:
        print(f"Email or url not provided for email {email} or url {url}")
        continue

    # Parsing filename from the URL
    query_string = urlparse(url).query
    filename = parse_qs(query_string).get('filename', [None])[0]

    if filename:
        # Setting up the email client
        from_email = SOURCE_EMAIL
        from_email_password = SOURCE_EMAIL_PASSWORD

        # Creating email
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = email
        msg['Subject'] = f"Free-books | {filename} | {datetime.datetime.now().isoformat()}"

        # Sending email
        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(from_email, from_email_password)

            # Downloading the file from the URL
            response = requests.get(url)

            if response.status_code == 200:
                # Creating a binary attachment
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(response.content)
                encoders.encode_base64(part)
                part.add_header('Content-Disposition',
                                f"attachment; filename={filename}")
                msg.attach(part)

            text = msg.as_string()
            server.sendmail(from_email, email, text)
            server.quit()
            print(f"Successfully sent {url} to {email}")
        except Exception as e:
            print(f"An error occurred: {e}")
    else:
        print(f"Filename not found for {url}")

# Deleting the value at REDIS_KEY after processing all items
print("Deleting redis key")
redis_client.delete(REDIS_KEY)
