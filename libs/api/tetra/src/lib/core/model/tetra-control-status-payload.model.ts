export interface TetraControlStatusPayload {
	message: string;
	sender: string;
	type: string;
	timestamp: string;
	data: {
		type: 'status';
		status: string;
		statusCode: string;
		statusText: string;
		destSSI: string;
		destName: string;
		srcSSI: string;
		srcName: string;
		ts: string;
		radioID: number;
		radioName: string;
		remark: string;
	};
}
