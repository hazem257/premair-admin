import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState({ email: false, password: false });
  const [showTestData, setShowTestData] = useState(false);
  const navigate = useNavigate();

  // بيانات المستخدم الثابتة
  const validCredentials = {
    email: "premier@gmail.com",
    password: "Premier123"
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (email === validCredentials.email && password === validCredentials.password) {
      localStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true);
      navigate("/");
    } else {
      setError(`البريد الإلكتروني أو كلمة المرور غير صحيحة`);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [type]: true });
      setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const toggleTestData = () => {
    setShowTestData(!showTestData);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" style={{backgroundColor:"#0C0950"}}>
      <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-lg">
        <div className="img" style={{width:"100%", display:"flex", alignItems:"center", justifyContent:"center"}}>
          <img src="/img.jpg" alt="premaier" style={{marginBottom:"25px"}} />
        </div>
       
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
          تسجيل الدخول
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="أدخل البريد الإلكتروني"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">كلمة المرور</label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="أدخل كلمة المرور"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={toggleTestData}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              نسيت كلمة المرور؟
            </button>
            
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              دخول
            </button>
          </div>
        </form>

        {showTestData && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-center text-sm text-gray-600 mb-2">بيانات الاختبار:</p>
            <div className="font-mono space-y-2">
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span>{validCredentials.email}</span>
                <button 
                  onClick={() => copyToClipboard(validCredentials.email, 'email')}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  {copied.email ? 'تم النسخ!' : 'نسخ'}
                </button>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span>{validCredentials.password}</span>
                <button 
                  onClick={() => copyToClipboard(validCredentials.password, 'password')}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  {copied.password ? 'تم النسخ!' : 'نسخ'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
