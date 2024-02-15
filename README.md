# An API Case Study for Glov

##### Hello Glov Team,

I am **pleased** to inform you that I have completed the task you assigned to me. Throughout this process, I utilized the "_Typescript_" language alongside the "_Google Cloud Platform._" Apart from the "_Service Account_" file, I have uploaded everything to this _GitHub_ repository.

You can find more detailed information regarding the usage of the API below. Please do not hesitate to reach out if you have any further requirements or inquiries.

###### Best regards, Onur Gümüş

---

### Case Study Requirements

- Host the API on a serverless platform like Cloudflare Workers, Azure Functions, or Google Cloud Functions using free tiers.
- The endpoint should accept a query parameter "stream" that can be set to "true" or "false".
- The request must include an Authorization header with a bearer token in the format "USER{XXX}" where XXX is a 3-digit numeric ID. Return a 401 Unauthorized response if no valid token is provided. Any token starting with "USER" followed by a 3-digit number is acceptable.
- The API response payload should be a JSON object with the following properties:

- "message": A customized welcome message including the user ID and incremental visit number. Example: "Welcome USER_123, this is your visit #456"
- "group": A hashed integer between 1-10 derived from the user ID. This should be consistent for a given user, always mapping them to the same group.
- "rate_limit_left": The number of requests remaining in the current rate limit window.
- "stream_seq": A sequence number that increments on each response when "stream=true".

- Rate limit each user ID to 4 requests per minute. Return a 429 Rate Limit Exceeded response on the 5th request within the window.
- When "stream=false", respond immediately with a single payload including "stream_seq=0".
- When "stream=true", respond with the same message 5 times, incrementing "stream_seq" on each response. Delay each response by 1 second.
- If multiple concurrent streams occur for one user, they should share the same rate limit but have independent visit counts and stream sequence numbers.

---

## Endpoints

### Stream Endpoint

The Stream endpoint allows users to interact with stream-related functionalities.

#### Base URL

https://us-central1-glov-api.cloudfunctions.net

#### Authentication

The API uses "UserID" to validate user access. Users need to include a valid `Bearer` token in the `Authorization` header to access the endpoints. For example;

    Bearer USER123

#### Available Endpoints

- **GET `/stream/getHello`**: Retrieves a random joke along with a greeting message for the authenticated user.

  - Example Request:
    ```
    GET /stream/getHello
    Headers:
        Authorization: Bearer <your_token_here>
    ```
  - Example Response:
    ```json
    {
      "status": "success",
      "message": "Hello <userID>",
      "joke": "<random_joke_here>"
    }
    ```

- **GET `/stream`**: Retrieves stream-related information for the authenticated user. Additionally, it allows users to initiate a stream if the `stream` query parameter is set to `true`.
  - Parameters:
    - `stream`: A boolean indicating whether to initiate a stream.
  - Example Request:
    ```
    GET /stream?stream=true
    Headers:
        Authorization: Bearer <your_token_here>
    ```
  - Example Response (Stream Initiation):
    ```json
    {
        "status": "success",
        "message": "<welcome_message>",
        "joke": "<random_joke_here>",
        "group": "<user_group>",
        "rate_limit_left": <rate_limit_remaining>,
        "steam_seq": <stream_sequence_number>
    }
    ```
  - Example Response (Regular Request):
    ```json
    {
        "status": "success",
        "message": "<welcome_message>",
        "joke": "<random_joke_here>",
        "group": "<user_group>",
        "rate_limit_left": <rate_limit_remaining>,
        "steam_seq": 0
    }
    ```

#### Error Handling

- **400 Bad Request**: If the required parameters are missing.
- **401 Unauthorized**: If the request lacks proper authentication.
- **403 Forbidden**: If the user is unauthorized or lacks permission to access the resource.
- **429 Too Many Requests**: If the user exceeds the rate limit.
