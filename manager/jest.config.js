/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",

	moduleNameMapper: {
		"^./manager_pb.js$": "<rootDir>/api/pb/manager_pb.ts",
		"^./worker_pb.js$": "<rootDir>/lib/client/pb/worker_pb.ts",
	},
};
