#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DocumentsManagementStack } from '../lib/documents-management-stack';

const app = new cdk.App();
new DocumentsManagementStack(app, 'DocumentsManagementStack');
