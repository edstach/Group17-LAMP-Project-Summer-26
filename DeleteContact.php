<?php
	$inData = getRequestInfo();

	$contactID = $inData["contactID"];
	$userID = $inData["userID"];

	$conn = new mysqli("localhost", "SlimeGuy" , "WeLoveSlime", "SlimeManager");

	if($conn->connect_error)
	{
		returnError($conn->connect_error);
	}
	else
	{
		$stmt = $conn->prepare("Delete from Contacts WHERE ID=? AND UserId=?");
		$stmt->bind_param("ss", $contactID, $userID);
		if($stmt->execute())
		{
			returnError("");
		}
		else
		{
			returnError($stmt->error);
		}
		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function jsonInfo($obj)
	{
		header('Content-type: application/json');
		echo $obj;
	}

	function returnError($err)
	{
        	$retValue = '{"error": "' . $err . '"}';
        	jsonInfo($retValue);
	}
?> 
