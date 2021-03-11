#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DocumentsManagementStack } from '../lib/documents-management-stack';
import { Tags } from '@aws-cdk/core';

const app = new cdk.App();
const documentsManagementStack = new DocumentsManagementStack(app, 'DocumentsManagementStack');
Tags.of(documentsManagementStack).add("App","DocumentManagementStack")
Tags.of(documentsManagementStack).add("Environment","Dev")
