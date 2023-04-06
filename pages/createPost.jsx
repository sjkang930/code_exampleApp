// import LanguageDropdown from "../components/LanguageDropdown";
import { useState } from "react";
import NewPostForm from "../components/NewPostForm";
import axios from "axios";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

export default function CreatePost() {
  const [language, setLanguage] = useState("markdown");
  const [code, setCode] = useState("");
  const router = useRouter();
  const onChange = (language) => {
    setLanguage(language);
  };
  const submitHandler = async (data) => {
    const res = await axios.post("/api/posts", data);
    if (!res.data.session) {
      signIn(); 
      return;
    }
    router.push("/");
  };

  return (
    <div>
      <h1>Create a post</h1>
      {/* { language = "markdown", onChange, buttonClassName = "", optionsClassName = "" } */}
      <NewPostForm
        defaultLanguage={language}
        defaultCode={code}
        onChange={onChange}
        onSubmit={submitHandler}
      />
    </div>
  );
}
