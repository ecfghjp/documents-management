import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as DocumentsManagement from '../lib/documents-management-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new DocumentsManagement.DocumentsManagementStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
