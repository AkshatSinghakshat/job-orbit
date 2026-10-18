import React from "react";

const PublicProfile = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold text-gray-800">
          Student Public Profile
        </h1>

        <p className="mt-2 text-gray-600">
          This profile is visible to recruiters.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="font-semibold text-gray-700">Name</h2>
            <p className="text-gray-600">Your Name</p>
          </div>

          <div>
            <h2 className="font-semibold text-gray-700">Email</h2>
            <p className="text-gray-600">your@email.com</p>
          </div>

          <div>
            <h2 className="font-semibold text-gray-700">Skills</h2>
            <p className="text-gray-600">React, JavaScript, Node.js</p>
          </div>

          <div>
            <h2 className="font-semibold text-gray-700">Education</h2>
            <p className="text-gray-600">Your College Name</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-gray-700">About Me</h2>
          <p className="mt-2 text-gray-600">
            Write your professional introduction here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;