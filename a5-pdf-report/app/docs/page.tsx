"use client";

import SwaggerUI from "swagger-ui-react";

export default function DocsPage() {
	return (
		<div className="swagger-page">
			<SwaggerUI url="/api/openapi.json" />
		</div>
	);
}
