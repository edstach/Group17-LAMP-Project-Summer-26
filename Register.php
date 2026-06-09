<?php
	$inData = getRequestInfo();

	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$login = $inData["login"];
	$password = $inData["password"];

	$conn = new mysqli("localhost", "SlimeGuy", "WeLoveSlime", "SlimeManager");

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
			$stmt->close();
			$conn->close();
			exit();
		}

		$stmt->close();

		$hash = password_hash($password, PASSWORD_DEFAULT);

		$insertStmt = $conn->prepare("INSERT INTO Users (firstName, lastName, Login, Password) VALUES(?,?,?,?)");
		$insertStmt->bind_param("ssss", $firstName, $lastName, $login, $hash);

		if($insertStmt->execute())
		{
			returnWithError("");
		}
		else
		{
			returnWithError($insertStmt->error);
		}
			
		$insertStmt->close();
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
		$retValue = array("error" => $err);
        	sendResultInfoAsJson(json_encode($retValue));
	}

?>