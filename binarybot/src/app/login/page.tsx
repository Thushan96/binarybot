import Head from "next/head";

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Head>
        <title>Login</title>
      </Head>
      <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-lg shadow-lg p-8 w-full max-w-5xl" style={{ width: '800px', height: '500px' }}>
        {/* Left Section */}
        <div className="md:w-1/2 text-center md:text-left p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Free Binary Bot & Deriv Bot
          </h1>
          <p className="text-gray-600 mb-6">Click to start free AutoTrading</p>
          <img
            src="/binarybot-logo.png"
            alt="BinaryBot"
            className="w-48 mx-auto md:mx-0 mb-6"
          />
          <p className="text-gray-600">
            Binary Bot and Deriv Bot auto trading platforms.
            <br />
            Start your algorithmic trading journey today!
          </p>
          <button className="mt-6 bg-red-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-red-700 w-full md:w-auto">
            NO TOKEN? CREATE AN ACCOUNT
          </button>
        </div>

        {/* Right Section */}
        <div className="md:w-1/2 rounded-lg p-6">
          <div className="text-center md:w-1/2 rounded-lg p-6">
            <h2 className="text-gray-800 text-lg font-semibold mb-4">
              Login to Continue
            </h2>
          </div>
          <div className="flex flex-col items-center mb-6">
            <button className="flex items-center justify-center w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700">
              LOGIN WITH <span className="ml-2 font-bold text-red-500">DERIV</span>
            </button>
            <p className="text-gray-500 my-4">OR</p>
            <input
              type="text"
              placeholder="Enter API Token"
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
            />
            <button className="bg-gray-800 text-white py-2 px-4 rounded-md shadow-md hover:bg-gray-700 w-full">
              SIGN IN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
