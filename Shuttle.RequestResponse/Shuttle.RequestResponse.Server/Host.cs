﻿using System;
using Castle.Windsor;
using Shuttle.Core.Castle;
using Shuttle.Core.Host;
using Shuttle.Core.Infrastructure;
using Shuttle.Esb;

namespace Shuttle.RequestResponse.Server
{
	public class Host : IHost, IDisposable
	{
		private IServiceBus _bus;

		public void Start()
		{
		    var container = new WindsorComponentContainer(new WindsorContainer());

		    ServiceBusConfigurator.Configure(container);

		    _bus = ServiceBus.Create(container).Start();
		}

	    public void Dispose()
		{
			_bus.Dispose();
		}
	}
}