import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2563eb] to-[#1e40af]">
      <div className="container-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">
            GECET
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Student Admission Portal
          </p>
          
          <div className="card max-w-md mx-auto">
            <h2 className="heading text-2xl mb-6">Welcome</h2>
            <p className="text-gray-600 mb-6">
              Access your admission portal with your credentials
            </p>
            
            <button
              onClick={() => navigate('/login')}
              className="btn-primary w-full"
            >
              Proceed to Login
            </button>
          </div>

          <p className="text-blue-100 mt-8 text-sm">
            © 2025 GECET. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
