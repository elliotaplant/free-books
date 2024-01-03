import os
import redis
import smtplib
import datetime
import requests
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

# Load the variables from .envrc
load_dotenv(dotenv_path=".envrc")

REDIS_URL = os.environ.get('REDIS_URL', None)
REDIS_KEY = os.environ.get('REDIS_KEY', None)
SOURCE_EMAIL = os.environ.get('SOURCE_EMAIL', None)
SOURCE_EMAIL_PASSWORD = os.environ.get('SOURCE_EMAIL_PASSWORD', None)

assert SOURCE_EMAIL_PASSWORD, "Missing SOURCE_EMAIL_PASSWORD"
assert SOURCE_EMAIL, "Missing SOURCE_EMAIL"
assert REDIS_KEY, "Missing REDIS_KEY"
assert REDIS_URL, "Missing REDIS_URL"

# Connect to redis
try:
    redis_client = redis.Redis.from_url(REDIS_URL)
    # Replace 'REDIS_KEY' with your actual key
    redis_result = redis_client.lrange(REDIS_KEY, 0, -1)

    logging.debug(f"Found {len(redis_result)} results from redis")

    # Deleting the value at REDIS_KEY to prevent other cron runs
    if len(redis_result) > 0:
        logging.info("Deleting redis key")
        redis_client.delete(REDIS_KEY)
except Exception as e:
    logging.error(f"Redis error: {e}")
    raise

for item in redis_result:
    try:
        # Assuming url and email are comma separated in Redis
        url, email = item.decode().split(',')
        logging.info(f"Sending {url} to {email}")

        if not email or not url:
            logging.warning(
                f"Email or url not provided for email {email} or url {url}")
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

                # Sending email
                server = smtplib.SMTP('smtp.gmail.com', 587)
                server.starttls()
                server.login(from_email, from_email_password)
                text = msg.as_string()
                server.sendmail(from_email, email, text)
                server.quit()
                logging.info(f"Successfully sent {url} to {email}")
            else:
                logging.warning(
                    f"Unexpected status code: {response.status_code}")
        else:
            logging.warning(f"Filename not found for {url}")
    except Exception as e:
        logging.error(
            f"An error occurred while processing {url} for {email}: {e}")
