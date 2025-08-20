import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

//-----------Types--------//
type Props = {
  redirectTo?: string; //path to redirect after login (defaults to previous page or "/")
};

//----------Component--------//

const LoginPage = ({ redirectTo }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  

  //---end of component--//
};
