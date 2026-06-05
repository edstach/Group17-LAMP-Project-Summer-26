<?php
	$inData = getRequestInfo();

	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$login = $inData["login"];
	$password = $inData["password"];

	$conn = new mysqli("localhost", "username", "password", "database");

	if($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}
	else
	{
		$stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
		$stmt->bind_param("s", $login);
		$stmt->execute();
		$result = $stmt->get_result();
		
		if($row = $result->fetch_assoc())
		{
			returnWithError("Username already exists");
		}
		else
		{
			$insertStmt = $conn->prepare("INSERT INTO Users (firstName, lastName, Login, Password) VALUES(?,?,?,?)");
			$insertStmt->bind_param("ssss", $firstName, $lastName, $login, $password);

			if($insertStmt->execute())
			{
				returnWithError("");
			}
			else
			{
				returnWithError($insertStmt->error);
			}
			$insertStmt->close();
		}
		$stmt->close();
		$conn->close();
	}
	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson($obj)
    	{
		header('Content-type: application/json');
		echo $obj;
    	}

	function returnWithError($err)
	{
		$retValue = '{"error":"' . $err . '"}';
        	sendResultInfoAsJson($retValue);
	}

?>